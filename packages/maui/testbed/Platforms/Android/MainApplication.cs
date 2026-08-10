using Android.App;
using Android.Runtime;

namespace SrTestbed;

/// <summary>
/// Hands the Android runtime the MauiApp built in MauiProgram. The [Application]
/// attribute is what registers it in the generated manifest.
/// </summary>
[Application]
public class MainApplication : MauiApplication
{
    public MainApplication(IntPtr handle, JniHandleOwnership ownership)
        : base(handle, ownership)
    {
    }

    protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
}
