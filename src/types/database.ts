// Custom database types for the application
// These provide proper typing until the auto-generated types are updated

export interface Profile {
  id: string;
  user_id: string | null;
  full_name: string | null;
  phone_number: string | null;
  county: string | null;
  sub_county: string | null;
  ward: string | null;
  farm_name: string | null;
  crop_types: string[] | null;
  farm_size_acres: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface AdminRole {
  id: string;
  user_id: string | null;
  role: string;
  created_at: string;
}

export interface SensorData {
  id: string;
  user_id: string | null;
  sensor_id: string | null;
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number | null;
  ph_level: number | null;
  created_at: string;
}

export interface IrrigationLog {
  id: string;
  user_id: string | null;
  zone: string | null;
  duration_minutes: number | null;
  water_used_liters: number | null;
  status: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  subject: string;
  message: string;
  status: string | null;
  priority: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  product_name: string | null;
  quantity: number | null;
  total_amount: number | null;
  status: string | null;
  created_at: string;
}

export interface RegisteredSensor {
  id: string;
  user_id: string | null;
  name: string | null;
  ip_address: string | null;
  sensor_type: string | null;
  location_zone: string | null;
  status: string | null;
  last_ping: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  location: string | null;
  specialization: string[] | null;
  rating: number | null;
  created_at: string;
}

export interface FinancialTransaction {
  id: string;
  user_id: string | null;
  transaction_type: string | null;
  category: string | null;
  amount: number | null;
  description: string | null;
  transaction_date: string | null;
  payment_method: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string | null;
  category: string | null;
  allocated_amount: number | null;
  spent_amount: number | null;
  period: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface FarmRecord {
  id: string;
  user_id: string | null;
  record_type: string | null;
  crop_type: string | null;
  area_size: number | null;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  record_date: string | null;
  location_zone: string | null;
  cost: number | null;
  created_at: string;
}

export interface DailyReport {
  id: string;
  user_id: string | null;
  report_date: string | null;
  irrigation_summary: any | null;
  weather_summary: any | null;
  sensor_summary: any | null;
  crop_suggestions: string[] | null;
  recommendations: string[] | null;
  created_at: string;
}

export interface VendorProduct {
  id: string;
  vendor_id: string | null;
  product_name: string | null;
  category: string | null;
  price: number | null;
  stock_quantity: number | null;
  unit: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string | null;
  message: string | null;
  type: string | null;
  read: boolean | null;
  created_at: string;
}