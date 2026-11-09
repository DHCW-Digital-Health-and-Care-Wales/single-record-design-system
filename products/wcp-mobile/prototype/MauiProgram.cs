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

#if ANDROID
        // Android draws its own underline under every Entry. Our field already
        // has a border (FieldBox), so the underline doubled it. Remove it for
        // every Entry in the app. Known-issues: "Android draws a second line
        // under every Entry".
        Microsoft.Maui.Handlers.EntryHandler.Mapper.AppendToMapping("SrNoUnderline", (handler, _) =>
            handler.PlatformView.BackgroundTintList =
                Android.Content.Res.ColorStateList.ValueOf(Android.Graphics.Color.Transparent));
#endif

        return builder.Build();
    }
}
