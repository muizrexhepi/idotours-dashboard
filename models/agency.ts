import { CompanyMetadata, Otp } from "./operator";

export interface Agency {
  _id: string;
  name: string;
  email: string;
  role: string;
  address: {
    city: string;
    country: string;
    street: string;
  };
  contact: {
    phone: string;
    contact_email: string;
  };
  password?: string;
  financial_data: AgencyFinancialData;
  is_active: boolean;
  is_applicant: boolean;
  company_metadata?: CompanyMetadata;
  otp?: Otp;
  createdAt?: string;
}

export interface AgencyFinancialData {
  percentage: number;
  total_sales: number;
  profit: number;
  debt: number;
}
