namespace WcpPrototype;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();

        // Roboto is the Android system font, so the design system's
        // FontFamily="Roboto" resolves with nothing bundled. An iOS target
        // would need Roboto bundled (known-issues: "Roboto is free only on
        // Android"), and medium weight is unreachable either way.
        builder.UseMauiApp<App>();

        return builder.Build();
    }
}
