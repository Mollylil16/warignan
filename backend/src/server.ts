import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./config/typeorm-data-source";
import { createApp } from "./app";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`WARIGNAN API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start WARIGNAN API", error);
    process.exit(1);
  }
}

bootstrap();

