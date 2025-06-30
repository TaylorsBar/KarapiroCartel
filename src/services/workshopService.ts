import { supabase } from '../lib/supabase';
import type { WorkshopBay, WorkshopBooking } from '../lib/supabase';

export class WorkshopService {
  static async getWorkshopBays(): Promise<WorkshopBay[]> {
    const { data, error } = await supabase
      .from('workshop_bays')
      .select('*')
      .eq('status', 'available')
      .order('bay_type', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getWorkshopBayById(id: string): Promise<WorkshopBay | null> {
    const { data, error } = await supabase
      .from('workshop_bays')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createBooking(bookingData: {
    bay_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
    total_cost: number;
    project_description?: string;
  }): Promise<WorkshopBooking> {
    const { data, error } = await supabase
      .from('workshop_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserBookings(userId: string): Promise<WorkshopBooking[]> {
    const { data, error } = await supabase
      .from('workshop_bookings')
      .select(`
        *,
        workshop_bays:bay_id (
          name,
          bay_type,
          equipment,
          features
        )
      `)
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getBayAvailability(
    bayId: string,
    date: string
  ): Promise<{ available: boolean; bookings: WorkshopBooking[] }> {
    const { data, error } = await supabase
      .from('workshop_bookings')
      .select('*')
      .eq('bay_id', bayId)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed', 'in_progress']);

    if (error) throw error;

    return {
      available: (data || []).length === 0,
      bookings: data || [],
    };
  }

  static async updateBookingStatus(
    bookingId: string,
    status: WorkshopBooking['status']
  ): Promise<WorkshopBooking> {
    const { data, error } = await supabase
      .from('workshop_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getBookingsByDate(date: string): Promise<WorkshopBooking[]> {
    const { data, error } = await supabase
      .from('workshop_bookings')
      .select(`
        *,
        workshop_bays:bay_id (
          name,
          bay_type
        ),
        users:user_id (
          full_name,
          email
        )
      `)
      .eq('booking_date', date)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}