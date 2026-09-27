self.addEventListener("push", event => {

    let data = {
        title: "Life in Progress 🌱",
        body: "You have a new reply. 💌",
        url: "/"
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (error) {
            console.error(
                "Push data error:",
                error
            );
        }
    }

    event.waitUntil(
        self.registration.showNotification(
            data.title,
            {
                body: data.body,
                icon: "/favicon.ico",
                badge: "/favicon.ico",
                data: {
                    url: data.url || "/"
                }
            }
        )
    );

});


self.addEventListener(
    "notificationclick",
    event => {

        event.notification.close();

        const url =
            event.notification.data?.url || "/";

        event.waitUntil(
            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            }).then(
                windowClients => {

                    for (
                        const client
                        of windowClients
                    ) {

                        if (
                            "focus" in client
                        ) {

                            client.navigate(url);

                            return client.focus();
                        }

                    }

                    if (
                        clients.openWindow
                    ) {

                        return clients.openWindow(
                            url
                        );

                    }

                }
            )
        );

    }
);