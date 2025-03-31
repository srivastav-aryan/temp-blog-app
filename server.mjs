import appConfig from "./src/config/appConfig.mjs";
import connectDataBase from "./src/config/dbConfig.mjs";
import app from "./src/app.mjs";

const server = async function () {
   try {
      await connectDataBase();

      const port = appConfig.port || 5000;
      app.listen(port, () => console.log(`Server running on port ${port}`));
   } catch (error) {
      console.error("Server startup error:", error);
      process.exit(1);
   }
};

server();
