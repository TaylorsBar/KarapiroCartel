import { supabase } from '../lib/supabase';
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