/* AREES LOOP: native notification display for an active installed PWA.
   Background Push is not enabled until subscriptions and the Web Push sender are provisioned. */
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target="/admin/dashboard";
  event.waitUntil((async()=>{
    const clientsList=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of clientsList){
      if(client.url.startsWith(self.location.origin)&&"focus" in client){
        await client.focus();
        if("navigate" in client)await client.navigate(target);
        return;
      }
    }
    if(self.clients.openWindow)await self.clients.openWindow(target);
  })());
});
