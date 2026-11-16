import { useEffect, useState } from "react";
import {
  loadDeliverySchedule,
  type DeliverySchedule,
} from "../utils/deliveryEstimate";

export const useDeliverySchedule = () => {
  const [schedule, setSchedule] = useState<DeliverySchedule | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      loadDeliverySchedule()
        .then((result) => {
          if (active) {
            setSchedule(result);
            setError(false);
          }
        })
        .catch(() => {
          if (active) setError(true);
        });
    };
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return { schedule, error };
};
