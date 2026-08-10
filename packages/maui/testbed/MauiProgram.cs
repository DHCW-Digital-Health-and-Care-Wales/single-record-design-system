using Microsoft.Extensions.Logging;

namespace SrTestbed;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                // Roboto is the Android system font, so Styles.xaml's
                // FontFamily="Roboto" resolves natively with nothing bundled.
                //
                // It does NOT on iOS or Windows. If this testbed grows an iOS
                // target, commit Roboto-Regular.ttf and Roboto-Bold.ttf under
                // Resources/Fonts and register them here as "Roboto", or every
                // style in Styles.xaml silently falls back to the system face.
                //
                // Worth knowing either way: SR's `label` and `heading-xs` are
                // MEDIUM weight, and MAUI has no medium FontAttributes — only
                // Regular and Bold. Medium needs Roboto-Medium.ttf bundled and
                // referenced as its own family. See the README.
            });

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
