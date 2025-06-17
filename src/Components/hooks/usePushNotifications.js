// src/hooks/usePushNotifications.js
import { useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const usePushNotifications = () => {
  useEffect(() => {
    const registerNotifications = async () => {
      try {
        const permissionStatus = await PushNotifications.requestPermissions();
        if (permissionStatus.receive === 'granted') {
          await PushNotifications.register();
        }

        PushNotifications.addListener('registration', async (token) => {
          console.log('📲 Token obtenido:', token.value);
          await saveToken(token.value);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('❌ Error de registro:', err);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📩 Notificación recibida:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('🔁 Acción desde notificación:', action);
        });

      } catch (err) {
        console.error('⚠️ Error en usePushNotifications:', err);
      }
    };

    const saveToken = async (token) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.uid) return;

      try {
        await setDoc(doc(db, "deviceTokens", user.uid), {
          token,
          updatedAt: Date.now(),
        });
        console.log('✅ Token guardado en Firestore');
      } catch (error) {
        console.error('🔥 Error guardando token:', error);
      }
    };

    registerNotifications();
  }, []);
};

export default usePushNotifications;
