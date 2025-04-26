const userSettingsRoutes = require("./routes/userSettings");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user/settings", userSettingsRoutes); 