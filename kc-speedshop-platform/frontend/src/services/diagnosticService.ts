import { supabase } from '../lib/supabase';
import { PerplexityService, type DiagnosticContext, type AdvancedDiagnostic } from './perplexityService';
import type { DiagnosticScan, AIInterpretation, Vehicle } from '../lib/supabase';

export class DiagnosticService {
  static async createDiagnosticScan(scanData: {
    vehicle_id: string;
    vin: string;
    trouble_codes: string[];
    raw_data: Record<string, any>;
  }): Promise<DiagnosticScan> {
    const { data, error } = await supabase
      .from('diagnostic_scans')
      .insert([scanData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getDiagnosticScans(userId: string): Promise<DiagnosticScan[]> {
    const { data, error } = await supabase
      .from('diagnostic_scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createAIInterpretation(interpretationData: {
    diagnostic_scan_id: string;
    interpretation: string;
    confidence_score: number;
    urgency_level: 'low' | 'medium' | 'high' | 'critical';
    estimated_cost_min?: number;
    estimated_cost_max?: number;
    possible_causes: string[];
    recommendations: string[];
    ai_model: string;
  }): Promise<AIInterpretation> {
    const { data, error } = await supabase
      .from('ai_interpretations')
      .insert([interpretationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAIInterpretation(scanId: string): Promise<AIInterpretation | null> {
    const { data, error } = await supabase
      .from('ai_interpretations')
      .select('*')
      .eq('diagnostic_scan_id', scanId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createAdvancedDiagnosticScan(scanData: {
    vehicle_id: string;
    vin: string;
    trouble_codes: string[];
    symptoms: string[];
    raw_data: Record<string, any>;
    vehicle_info: {
      make: string;
      model: string;
      year: number;
      mileage: number;
      engine?: string;
      transmission?: string;
    };
  }): Promise<{
    scan: DiagnosticScan;
    basicInterpretation: AIInterpretation;
    advancedDiagnostic: AdvancedDiagnostic;
    vehicle: Vehicle;
  }> {
    try {
      // Create basic diagnostic scan
      const scan = await this.createDiagnosticScan({
        vehicle_id: scanData.vehicle_id,
        vin: scanData.vin,
        trouble_codes: scanData.trouble_codes,
        raw_data: scanData.raw_data,
      });

      // Get vehicle info
      const vehicle = await this.getVehicleById(scanData.vehicle_id);
      if (!vehicle) throw new Error('Vehicle not found');

      // Generate basic AI interpretation
      const basicInterpretation = await this.generateAIInterpretation(scan, vehicle);

      // Get advanced diagnostic from Perplexity
      const diagnosticContext: DiagnosticContext = {
        vehicleInfo: scanData.vehicle_info,
        troubleCodes: scanData.trouble_codes,
        symptoms: scanData.symptoms,
        environment: 'New Zealand roads, climate conditions'
      };

      const advancedDiagnostic = await PerplexityService.getAdvancedDiagnostic(diagnosticContext);

      return {
        scan,
        basicInterpretation,
        advancedDiagnostic,
        vehicle
      };
    } catch (error) {
      console.error('Error creating advanced diagnostic scan:', error);
      throw error;
    }
  }

  static async getSpecialistConsultation(
    scanId: string,
    specialization: 'engine' | 'transmission' | 'electrical' | 'suspension' | 'emissions'
  ): Promise<string> {
    try {
      const scan = await this.getDiagnosticScanById(scanId);
      if (!scan) throw new Error('Diagnostic scan not found');

      const vehicle = await this.getVehicleById(scan.vehicle_id);
      if (!vehicle) throw new Error('Vehicle not found');

      const context: DiagnosticContext = {
        vehicleInfo: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          mileage: vehicle.mileage,
          engine: vehicle.engine,
          transmission: vehicle.transmission
        },
        troubleCodes: scan.trouble_codes,
        symptoms: [], // Would extract from scan raw_data
      };

      return await PerplexityService.getSpecialistConsultation(context, specialization);
    } catch (error) {
      console.error('Error getting specialist consultation:', error);
      throw error;
    }
  }

  static async getPartsMarketAnalysis(
    partName: string,
    vehicleId: string
  ): Promise<any> {
    try {
      const vehicle = await this.getVehicleById(vehicleId);
      if (!vehicle) throw new Error('Vehicle not found');

      return await PerplexityService.getRealTimeMarketAnalysis(partName, {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        engine: vehicle.engine,
        transmission: vehicle.transmission
      });
    } catch (error) {
      console.error('Error getting parts market analysis:', error);
      throw error;
    }
  }

  static async processOBD2Scan(scanData: {
    vin: string;
    trouble_codes: string[];
    mileage: number;
    year: number;
    vehicle_id?: string;
  }): Promise<{
    scan: DiagnosticScan;
    interpretation: AIInterpretation;
    vehicle: Vehicle;
  }> {
    try {
      // Get or create vehicle
      let vehicle: Vehicle;
      if (scanData.vehicle_id) {
        const { data: existingVehicle, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', scanData.vehicle_id)
          .single();

        if (error) throw error;
        vehicle = existingVehicle;
      } else {
        // Try to find vehicle by VIN
        const { data: existingVehicle } = await supabase
          .from('vehicles')
          .select('*')
          .eq('vin', scanData.vin)
          .single();

        if (existingVehicle) {
          vehicle = existingVehicle;
        } else {
          // Create new vehicle record
          const { data: newVehicle, error } = await supabase
            .from('vehicles')
            .insert([{
              vin: scanData.vin,
              make: 'Unknown', // Will be updated with VIN decode
              model: 'Unknown',
              year: scanData.year,
              mileage: scanData.mileage,
            }])
            .select()
            .single();

          if (error) throw error;
          vehicle = newVehicle;
        }
      }

      // Create diagnostic scan
      const scan = await this.createDiagnosticScan({
        vehicle_id: vehicle.id,
        vin: scanData.vin,
        trouble_codes: scanData.trouble_codes,
        raw_data: {
          mileage: scanData.mileage,
          year: scanData.year,
          scan_timestamp: new Date().toISOString(),
        },
      });

      // Generate AI interpretation
      const interpretation = await this.generateAIInterpretation(scan, vehicle);

      return { scan, interpretation, vehicle };
    } catch (error) {
      console.error('Error processing OBD2 scan:', error);
      throw error;
    }
  }

  private static async getDiagnosticScanById(scanId: string): Promise<DiagnosticScan | null> {
    const { data, error } = await supabase
      .from('diagnostic_scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private static async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private static async generateAIInterpretation(
    scan: DiagnosticScan,
    vehicle: Vehicle
  ): Promise<AIInterpretation> {
    // Simulate AI interpretation generation
    // In production, this would call the X.AI Grok API
    const troubleCode = scan.trouble_codes[0] || 'P0000';
    
    let interpretation: string;
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    let possibleCauses: string[];
    let recommendations: string[];
    let estimatedCostMin: number;
    let estimatedCostMax: number;

    // Simple rule-based interpretation for demo
    switch (troubleCode.substring(0, 4)) {
      case 'P030':
        interpretation = 'Multiple cylinder misfires detected. This could be caused by worn spark plugs, faulty ignition coils, or fuel system issues.';
        urgencyLevel = 'medium';
        possibleCauses = ['Worn spark plugs', 'Faulty ignition coils', 'Fuel injector issues', 'Vacuum leaks'];
        recommendations = ['Replace spark plugs', 'Check ignition coils', 'Inspect fuel system', 'Test for vacuum leaks'];
        estimatedCostMin = 150;
        estimatedCostMax = 450;
        break;
      case 'P042':
        interpretation = 'Catalytic converter efficiency below threshold. This indicates the catalytic converter may need replacement.';
        urgencyLevel = 'medium';
        possibleCauses = ['Worn catalytic converter', 'Oxygen sensor failure', 'Engine running rich/lean'];
        recommendations = ['Replace catalytic converter', 'Check oxygen sensors', 'Diagnose fuel mixture'];
        estimatedCostMin = 800;
        estimatedCostMax = 1500;
        break;
      default:
        interpretation = `Diagnostic trouble code ${troubleCode} detected. This requires further investigation to determine the root cause.`;
        urgencyLevel = 'medium';
        possibleCauses = ['Various potential causes', 'Requires detailed diagnosis'];
        recommendations = ['Professional diagnostic scan', 'Component testing', 'System inspection'];
        estimatedCostMin = 100;
        estimatedCostMax = 300;
    }

    return await this.createAIInterpretation({
      diagnostic_scan_id: scan.id,
      interpretation,
      confidence_score: Math.floor(Math.random() * 20) + 70, // 70-90%
      urgency_level: urgencyLevel,
      estimated_cost_min: estimatedCostMin,
      estimated_cost_max: estimatedCostMax,
      possible_causes: possibleCauses,
      recommendations,
      ai_model: 'grok-3-latest',
    });
  }
}