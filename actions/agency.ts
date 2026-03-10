import apiClient from "@/lib/axios";
import { Agency } from "@/models/agency";

export interface ICreateAgencyPayload {
  name: string;
  email: string;
  password: string;
  address: {
    city: string;
    country: string;
    street: string;
  };
  contact: {
    phone: string;
    contact_email: string;
  };
  financial_data: {
    percentage: number;
  };
  company_metadata?: {
    name?: string;
    vat?: string;
  };
}

export const createAgency = async (
  agency: ICreateAgencyPayload,
): Promise<string> => {
  try {
    const res = await apiClient.post(`/agency/create`, { agency });
    return res?.data?.message;
  } catch (error: any) {
    console.error("Create Agency Error:", error);
    throw error;
  }
};

export const getAllAgencies = async (): Promise<Agency[]> => {
  try {
    const res = await apiClient.get(`/agency`);
    return res?.data?.data as Agency[];
  } catch (error) {
    console.error("Get Agencies Error:", error);
    return [];
  }
};

export const getAgencyById = async (
  agency_id: string,
): Promise<Agency | null> => {
  try {
    const res = await apiClient.get(`/agency/${agency_id}`);
    return res?.data?.data as Agency;
  } catch (error) {
    console.error("Get Agency Error:", error);
    return null;
  }
};

export const updateAgency = async (
  agency_id: string,
  agency: Partial<ICreateAgencyPayload>,
): Promise<Agency | null> => {
  try {
    const res = await apiClient.put(`/agency/${agency_id}`, { agency });
    return res?.data?.data as Agency;
  } catch (error: any) {
    console.error("Update Agency Error:", error);
    throw error;
  }
};

export const deleteAgency = async (agency_id: string): Promise<void> => {
  try {
    await apiClient.delete(`/agency/${agency_id}`);
  } catch (error: any) {
    console.error("Delete Agency Error:", error);
    throw error;
  }
};

export interface IMonthlyDebtReport {
  year: number;
  month: number;
  total_sales: number;
  booking_count: number;
  profit: number;
  debt: number;
  is_paid?: boolean;
}

export const getAgencyMonthlyReport = async (
  agency_id: string,
): Promise<IMonthlyDebtReport[]> => {
  try {
    const res = await apiClient.get(`/agency/${agency_id}/monthly-report`);
    return res?.data?.data as IMonthlyDebtReport[];
  } catch (error) {
    console.error("Monthly Report Error:", error);
    return [];
  }
};

export const payAgencyMonthlyDebt = async (
  agency_id: string,
  year: number,
  month: number,
): Promise<void> => {
  try {
    await apiClient.post(`/agency/${agency_id}/pay-debt`, { year, month });
  } catch (error: any) {
    console.error("Pay Debt Error:", error);
    throw error;
  }
};

export const toggleAgencyStatus = async (
  agency_id: string,
  is_active: boolean,
): Promise<Agency | null> => {
  try {
    const res = await apiClient.put(`/agency/${agency_id}`, {
      agency: { is_active },
    });
    return res?.data?.data as Agency;
  } catch (error: any) {
    console.error("Toggle Status Error:", error);
    throw error;
  }
};
