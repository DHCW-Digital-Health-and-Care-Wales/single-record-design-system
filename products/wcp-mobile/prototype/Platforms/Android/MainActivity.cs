using Android.App;
using Android.Content.PM;

namespace WcpPrototype;

/// <summary>
/// The Android entry point. MainLauncher = true is what gives the APK a
/// launchable activity; without it BrowserStack App Live rejects the upload
/// (docs/engineering/known-issues.md). ConfigurationChanges is the stock MAUI
/// set, so theme and font-scale changes do not recreate the activity.
/// </summary>
[Activity(
    Theme = "@style/Maui.SplashTheme",
    MainLauncher = true,
    LaunchMode = LaunchMode.SingleTop,
    ConfigurationChanges = ConfigChanges.ScreenSize
        | ConfigChanges.Orientation
        | ConfigChanges.UiMode
        | ConfigChanges.ScreenLayout
        | ConfigChanges.SmallestScreenSize
        | ConfigChanges.Density)]
public class MainActivity : MauiAppCompatActivity
{
}
