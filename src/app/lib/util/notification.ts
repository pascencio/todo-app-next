export function sendNotification(title: string, body: string, interactive: boolean = false) {
    if (!("Notification" in window)) {
        alert("This browser does not support notifications");
    }
    else if (Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            requireInteraction: interactive,
        });
    }
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification("Notification permission granted");
            }
        });
    }
}