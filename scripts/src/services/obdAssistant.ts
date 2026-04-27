// Умный ассистент «ОНИКС» — генерирует уведомления во время OBD-эмуляции
// и отправляет сообщения в чат владельца

import { loadAppData } from '../lib/storage';

export interface AssistantMessage {
  id: string;
  from: 'ONIX_ASSISTANT';
  text: string;
  action?: {
    type: 'schedule' | 'find_gas' | 'order_part';
    label: string;
    payload: string;
  };
  timestamp: string;
}

// Проверяет состояние автомобиля и генерирует сообщения
export function checkVehicleStatus(): AssistantMessage[] {
  const data = loadAppData();
  const messages: AssistantMessage[] = [];
  const mileage = data.telemetry.mileage;

  // Проверяем напоминания по регламенту
  const reminders = data.reminders || [];
  reminders.forEach(rem => {
    const due = rem.dueMileage;
    const diff = due - mileage;

    if (diff > 0 && diff <= 500) {
      messages.push({
        id: `rem_${rem.id}_${Date.now()}`,
        from: 'ONIX_ASSISTANT',
        text: `До замены «${rem.text}» осталось ${Math.round(diff)} км. Хотите записаться в сервис?`,
        action: {
          type: 'schedule',
          label: 'Записаться',
          payload: rem.text
        },
        timestamp: new Date().toISOString()
      });
    } else if (diff <= 0) {
      messages.push({
        id: `rem_${rem.id}_${Date.now()}`,
        from: 'ONIX_ASSISTANT',
        text: `Пробег достиг регламентного значения для замены «${rem.text}». Требуется срочная замена.`,
        action: {
          type: 'schedule',
          label: 'Записаться',
          payload: rem.text
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  // Проверяем уровень топлива (если есть в телеметрии)
  const fuelLevel = data.telemetry.fuelLevel;
  if (fuelLevel !== undefined && fuelLevel < 10) {
    messages.push({
      id: `fuel_${Date.now()}`,
      from: 'ONIX_ASSISTANT',
      text: `Низкий уровень топлива (${fuelLevel} л). Найти ближайшую АЗС?`,
      action: {
        type: 'find_gas',
        label: 'Найти АЗС',
        payload: 'gas_station'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Проверяем ошибки двигателя
  const errors = data.telemetry.errors;
  if (errors && errors > 0) {
    messages.push({
      id: `error_${Date.now()}`,
      from: 'ONIX_ASSISTANT',
      text: `Обнаружены ошибки двигателя (${errors}). Рекомендуется диагностика.`,
      action: {
        type: 'schedule',
        label: 'Записаться',
        payload: 'Диагностика двигателя'
      },
      timestamp: new Date().toISOString()
    });
  }

  return messages;
}

// Получает накопленные сообщения из хранилища
export function getAssistantMessages(): AssistantMessage[] {
  const data = loadAppData();
  return data.assistantMessages || [];
}

// Сохраняет сообщение в хранилище
export function saveAssistantMessage(message: AssistantMessage): void {
  const data = loadAppData();
  if (!data.assistantMessages) data.assistantMessages = [];
  data.assistantMessages.push(message);
  // Храним последние 50 сообщений
  if (data.assistantMessages.length > 50) {
    data.assistantMessages = data.assistantMessages.slice(-50);
  }
  import('../lib/storage').then(({ saveAppData }) => saveAppData(data));
}