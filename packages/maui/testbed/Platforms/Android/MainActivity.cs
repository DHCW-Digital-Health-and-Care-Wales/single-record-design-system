using Android.App;
using Android.Content.PM;

namespace SrTestbed;

/// <summary>
/// The Android entry point.
///
/// MainLauncher = true is what puts an intent filter for
/// android.intent.action.MAIN / android.intent.category.LAUNCHER into the
/// generated AndroidManifest.xml. Without this file the project still builds
/// and still produces an APK — it simply has nothing to start, which is what
/// BrowserStack App Live reports as "Launcher activity was not found in
/// AndroidManifest.xml".
///
/// ConfigurationChanges is the stock MAUI set. It tells Android that this
/// activity handles rotation, theme changes and font-scale (density) changes
/// itself rather than being destroyed and recreated — which matters here,
/// because switching light/dark and raising the system font size are two of the
/// four things this testbed exists to check.
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
