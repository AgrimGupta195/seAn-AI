import connectDB from "./lib/db.js"
import app from "./app.js";

const PORT = process.env.PORT || 5000;

// Only start the HTTP server when not running on Vercel
if (process.env.VERCEL !== "1") {
    const startServer = async () => {
        try {
            await connectDB();
            app.listen(PORT, () => {
                console.log(`🚀 Server running on http://localhost:${PORT}`);
            });
        } catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    };

    startServer();
}

export default app;


