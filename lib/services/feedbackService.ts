import httpClient from './httpClient';
import { generateUUID } from '../utils/uuid';
import { ENDPOINTS } from '@/lib/constants';

export interface FeedbackPayload {
  userId: string;
  userAlias: string;
  ambiente: number;
  experiencia: number;
  mejora: number;
  comentario: string;
}

export const feedbackService = {
  async sendFeedback(payload: FeedbackPayload) {
    const { data } = await httpClient.post(ENDPOINTS.FEEDBACKS, {
      id: generateUUID(),
      ...payload,
      timestamp: new Date().toISOString(),
    });
    return data;
  },
};
