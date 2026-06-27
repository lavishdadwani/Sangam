import { useState, useEffect } from "react";
import settingsAPI from "../../services/settings";

const DEFAULT_SETTINGS = {
  deliveryCharge: { base: 30, perKm: 5, freeAbove: 500 },
  tax: { gst: 18 },
  order: { minOrderAmount: 100, maxDeliveryRadiusKm: 20 },
};

const useGetPlatformSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const controller = new AbortController();
    settingsAPI.getPlatformSettings()
      .then((result) => {
        if (result.ok && result.data?.data) {
          setSettings(result.data.data);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const getDeliveryFee = (orderTotal) => {
    const { base, freeAbove } = settings.deliveryCharge;
    return orderTotal >= freeAbove ? 0 : base;
  };

  return { settings, getDeliveryFee };
};

export default useGetPlatformSettings;
