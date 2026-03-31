import neu, { $$, dom } from "./app/neu.js";

const routerConfig = {
  root: "welcome",
  loaderStyle: 1,
  biosStyle: true,
};

neu.ready(async () => {
  neu.configRouter(routerConfig);
  await neu.injectPage();
  await neu.routerStart();
  
  neu.loop.start();
  neu.debug.set(true);
  neu.debug.log("System Started!");
  
  neu.on(
    "tick",
    (dt) => {
      // Bisa untuk global update
      // looping cycle di sini
    },
    { page: "global" }
  );

  neu.loop.schedule(
    "repeatTask",
    async () => {
    },
    5000
  );
});

neu.on("pageBeforeOut", (pageName) => {
  neu.debug.log(`[App] pageBeforeOut -> ${pageName}`);
});

neu.on("pageMount", (pageName) => {
  neu.debug.log(`[App] pageMount -> ${pageName}`);
});

neu.on("pageInit", (pageName) => {
  neu.debug.log(`[App] pageInit -> ${pageName}`);
});

neu.on("pageUnmount", (pageName) => {
  neu.debug.log(`[App] pageUnmount -> ${pageName}`);
});

neu.on("pageDestroy", (pageName) => {
  neu.debug.log(`[App] pageDestroy -> ${pageName}`);
});

neu.on("pageAfterIn", (pageName) => {
  neu.debug.log(`[App] pageAfterIn -> ${pageName}`);
});
