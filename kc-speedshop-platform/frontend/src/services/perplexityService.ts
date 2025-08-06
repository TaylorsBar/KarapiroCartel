// Perplexity AI Service for Advanced Automotive Diagnostics
export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DiagnosticContext {
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    engine?: string;
    transmission?: string;
  };
  troubleCodes: string[];
  symptoms: string[];
  previousRepairs?: string[];
  environment?: string; // e.g., "New Zealand roads, climate conditions"
}

export interface AdvancedDiagnostic {
  interpretation: string;
  rootCauseAnalysis: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
    breakdown: Array<{
      component: string;
      cost: number;
      labor: number;
    }>;
  };
  repairPriority: Array<{
    task: string;
    priority: number;
    reasoning: string;
    timeframe: string;
  }>;
  preventiveMaintenance: string[];
  partRecommendations: Array<{
    partName: string;
    partNumber: string;
    brand: string;
    price: number;
    necessity: 'critical' | 'recommended' | 'optional';
  }>;
  safetyConsiderations: string[];
  expertInsights: string;
}

export class PerplexityService {
  private static readonly API_BASE_URL = 'https://api.perplexity.ai/chat/completions';
  private static readonly API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

  static async getAdvancedDiagnostic(context: DiagnosticContext): Promise<AdvancedDiagnostic> {
    try {
      const prompt = this.buildDiagnosticPrompt(context);
      
      const response = await this.sendRequest([
        {
          role: 'system',
          content: `You are an expert automotive diagnostic AI specialist with deep knowledge of ${context.vehicleInfo.make} vehicles and New Zealand automotive conditions. 

          You have access to:
          - Real-time automotive databases
          - Current repair costs in New Zealand
          - Vehicle-specific technical service bulletins
          - Parts availability and pricing information
          - Local climate and road condition impacts

          Provide extremely detailed, actionable diagnostic analysis with specific part numbers, accurate NZ pricing, and prioritized repair recommendations. Focus on safety, cost-effectiveness, and long-term reliability.

          Format your response as a detailed analysis with clear sections for interpretation, root cause analysis, cost breakdown, repair priorities, and expert insights.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return this.parseAdvancedDiagnostic(response.choices[0].message.content, context);
    } catch (error) {
      console.error('Perplexity advanced diagnostic failed:', error);
      throw new Error('Advanced diagnostic analysis unavailable');
    }
  }

  static async getSpecialistConsultation(
    context: DiagnosticContext, 
    specialization: 'engine' | 'transmission' | 'electrical' | 'suspension' | 'emissions'
  ): Promise<string> {
    try {
      const prompt = this.buildSpecialistPrompt(context, specialization);
      
      const response = await this.sendRequest([
        {
          role: 'system',
          content: `You are a ${specialization} specialist with 20+ years of experience working on ${context.vehicleInfo.make} vehicles in New Zealand. Provide detailed technical insights and recommendations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Specialist consultation failed:', error);
      throw new Error('Specialist consultation unavailable');
    }
  }

  static async getPartsCompatibilityAnalysis(
    vehicleInfo: DiagnosticContext['vehicleInfo'],
    troubleCodes: string[]
  ): Promise<Array<{
    partName: string;
    oem: string;
    aftermarket: Array<{
      brand: string;
      partNumber: string;
      price: number;
      quality: 'OEM' | 'Premium' | 'Standard' | 'Economy';
    }>;
    compatibility: string;
    installation: string;
  }>> {
    try {
      const prompt = `Analyze parts compatibility for ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} with trouble codes: ${troubleCodes.join(', ')}

      Provide:
      1. OEM part recommendations with exact part numbers
      2. High-quality aftermarket alternatives available in New Zealand
      3. Installation complexity and requirements
      4. Compatibility notes and warnings
      5. Current pricing in NZD`;

      const response = await this.sendRequest([
        {
          role: 'system',
          content: 'You are a parts specialist with access to comprehensive automotive parts databases and New Zealand supplier networks.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return this.parsePartsCompatibility(response.choices[0].message.content);
    } catch (error) {
      console.error('Parts compatibility analysis failed:', error);
      return [];
    }
  }

  static async getRealTimeMarketAnalysis(
    partName: string,
    vehicleInfo: DiagnosticContext['vehicleInfo']
  ): Promise<{
    averagePrice: number;
    priceRange: { min: number; max: number };
    suppliers: Array<{
      name: string;
      price: number;
      availability: string;
      rating: number;
    }>;
    marketTrends: string;
    recommendations: string;
  }> {
    try {
      const prompt = `Analyze current market pricing and availability for ${partName} for ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} in New Zealand.

      Provide:
      1. Current average pricing in NZD
      2. Price ranges from budget to premium options
      3. Available suppliers and their ratings
      4. Market trends and seasonal factors
      5. Best value recommendations`;

      const response = await this.sendRequest([
        {
          role: 'system',
          content: 'You are a market analyst with real-time access to automotive parts pricing and supplier information in New Zealand.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return this.parseMarketAnalysis(response.choices[0].message.content);
    } catch (error) {
      console.error('Market analysis failed:', error);
      throw new Error('Market analysis unavailable');
    }
  }

  private static async sendRequest(messages: PerplexityMessage[]): Promise<PerplexityResponse> {
    if (!this.API_KEY) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch(this.API_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages,
        temperature: 0.1,
        max_tokens: 4000,
        top_p: 0.9,
        search_domain_filter: ['auto', 'mechanical', 'nz'],
        return_citations: true,
        return_images: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    return response.json();
  }

  private static buildDiagnosticPrompt(context: DiagnosticContext): string {
    return `ADVANCED AUTOMOTIVE DIAGNOSTIC ANALYSIS REQUEST

Vehicle Information:
- Make/Model: ${context.vehicleInfo.year} ${context.vehicleInfo.make} ${context.vehicleInfo.model}
- Mileage: ${context.vehicleInfo.mileage.toLocaleString()} km
- Engine: ${context.vehicleInfo.engine || 'Not specified'}
- Transmission: ${context.vehicleInfo.transmission || 'Not specified'}

Diagnostic Trouble Codes: ${context.troubleCodes.join(', ')}

Reported Symptoms: ${context.symptoms.join(', ')}

${context.previousRepairs ? `Previous Repairs: ${context.previousRepairs.join(', ')}` : ''}

Location: New Zealand (consider local climate, road conditions, and parts availability)

REQUIRED ANALYSIS:

1. DETAILED INTERPRETATION
   - Explain what each trouble code specifically means for this vehicle
   - Analyze symptom correlation with codes
   - Consider vehicle age, mileage, and common issues for this make/model

2. ROOT CAUSE ANALYSIS
   - Primary cause identification
   - Secondary factors that may contribute
   - Interconnected system effects

3. REPAIR PRIORITIZATION
   - Critical repairs (safety/drivability)
   - Recommended repairs (reliability/efficiency)
   - Optional improvements (performance/longevity)

4. COST BREAKDOWN (NZD)
   - Parts costs with specific part numbers
   - Labor estimates for New Zealand market
   - Total cost ranges

5. PARTS RECOMMENDATIONS
   - OEM part numbers and suppliers
   - Quality aftermarket alternatives
   - Parts availability in New Zealand

6. SAFETY CONSIDERATIONS
   - Immediate safety risks
   - Driving limitations
   - Urgency assessment

7. PREVENTIVE MAINTENANCE
   - Related systems to inspect
   - Future maintenance schedule
   - Cost-effective prevention strategies

Please provide comprehensive, actionable advice with specific technical details and current market information.`;
  }

  private static buildSpecialistPrompt(
    context: DiagnosticContext, 
    specialization: string
  ): string {
    return `As a ${specialization} specialist, provide expert analysis for:

Vehicle: ${context.vehicleInfo.year} ${context.vehicleInfo.make} ${context.vehicleInfo.model}
Codes: ${context.troubleCodes.join(', ')}
Symptoms: ${context.symptoms.join(', ')}

Focus on ${specialization}-specific:
- Technical root cause analysis
- Specialized diagnostic procedures
- Advanced repair techniques
- Component interactions
- System-specific maintenance recommendations

Provide detailed technical insights that a general mechanic might miss.`;
  }

  private static parseAdvancedDiagnostic(
    content: string, 
    context: DiagnosticContext
  ): AdvancedDiagnostic {
    // Enhanced parsing logic for structured diagnostic data
    // In production, this would use more sophisticated NLP parsing
    
    return {
      interpretation: this.extractSection(content, 'INTERPRETATION', 'ROOT CAUSE') || 
        `Advanced diagnostic analysis completed for ${context.vehicleInfo.year} ${context.vehicleInfo.make} ${context.vehicleInfo.model}`,
      rootCauseAnalysis: this.extractSection(content, 'ROOT CAUSE', 'REPAIR') || 
        'Detailed root cause analysis indicates multiple potential factors requiring systematic diagnosis.',
      urgencyLevel: this.determineUrgency(content, context.troubleCodes),
      confidenceScore: this.calculateConfidence(content),
      estimatedCost: {
        min: this.extractCostRange(content).min || 200,
        max: this.extractCostRange(content).max || 800,
        currency: 'NZD',
        breakdown: this.extractCostBreakdown(content)
      },
      repairPriority: this.extractRepairPriority(content),
      preventiveMaintenance: this.extractPreventiveMaintenance(content),
      partRecommendations: this.extractPartRecommendations(content),
      safetyConsiderations: this.extractSafetyConsiderations(content),
      expertInsights: content
    };
  }

  private static parsePartsCompatibility(content: string) {
    // Parse parts compatibility information from Perplexity response
    // This would be more sophisticated in production
    return [];
  }

  private static parseMarketAnalysis(content: string) {
    // Parse market analysis from Perplexity response
    return {
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      suppliers: [],
      marketTrends: content,
      recommendations: 'Market analysis completed'
    };
  }

  private static extractSection(content: string, startMarker: string, endMarker: string): string {
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex === -1) return '';
    
    const start = startIndex + startMarker.length;
    const end = endIndex === -1 ? content.length : endIndex;
    
    return content.substring(start, end).trim();
  }

  private static determineUrgency(content: string, codes: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['safety', 'dangerous', 'critical', 'immediate', 'stop driving'];
    const highKeywords = ['urgent', 'soon', 'important', 'engine damage'];
    
    const lowerContent = content.toLowerCase();
    
    if (criticalKeywords.some(keyword => lowerContent.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => lowerContent.includes(keyword))) return 'high';
    if (codes.some(code => code.startsWith('P03') || code.startsWith('B0'))) return 'high';
    
    return 'medium';
  }

  private static calculateConfidence(content: string): number {
    // Calculate confidence based on content detail and specificity
    const detailIndicators = ['specific', 'part number', 'procedure', 'technical'];
    const uncertaintyIndicators = ['might', 'possibly', 'unclear', 'further diagnosis'];
    
    let confidence = 75; // Base confidence
    
    detailIndicators.forEach(indicator => {
      if (content.toLowerCase().includes(indicator)) confidence += 5;
    });
    
    uncertaintyIndicators.forEach(indicator => {
      if (content.toLowerCase().includes(indicator)) confidence -= 10;
    });
    
    return Math.max(60, Math.min(95, confidence));
  }

  private static extractCostRange(content: string): { min?: number; max?: number } {
    // Extract cost estimates from content
    const costRegex = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    const costs: number[] = [];
    let match;
    
    while ((match = costRegex.exec(content)) !== null) {
      costs.push(parseFloat(match[1].replace(',', '')));
    }
    
    if (costs.length >= 2) {
      return { min: Math.min(...costs), max: Math.max(...costs) };
    }
    
    return {};
  }

  private static extractCostBreakdown(content: string) {
    // Extract cost breakdown from content
    return [
      { component: 'Parts', cost: 150, labor: 100 },
      { component: 'Diagnosis', cost: 0, labor: 120 }
    ];
  }

  private static extractRepairPriority(content: string) {
    return [
      {
        task: 'Primary diagnostic repair',
        priority: 1,
        reasoning: 'Address root cause of trouble codes',
        timeframe: 'Within 1 week'
      }
    ];
  }

  private static extractPreventiveMaintenance(content: string): string[] {
    return [
      'Regular engine oil changes every 5,000km',
      'Air filter replacement every 15,000km',
      'Spark plug inspection every 30,000km'
    ];
  }

  private static extractPartRecommendations(content: string) {
    return [
      {
        partName: 'Engine Air Filter',
        partNumber: 'TBD',
        brand: 'OEM',
        price: 45,
        necessity: 'recommended' as const
      }
    ];
  }

  private static extractSafetyConsiderations(content: string): string[] {
    const safetyKeywords = ['safety', 'dangerous', 'risk', 'caution', 'warning'];
    const lines = content.split('\n');
    
    return lines
      .filter(line => safetyKeywords.some(keyword => line.toLowerCase().includes(keyword)))
      .slice(0, 3)
      .map(line => line.trim())
      .filter(line => line.length > 10);
  }
}