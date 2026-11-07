// Constructs what an app constructs at launch, off-device, and fails if any
// of it throws. Each packaged dictionary is built ALONE, which is exactly what
// <sr:SrStyles /> does in a consumer's App.xaml, then the WCP prototype's App
// and every page. See packages/maui/smoke/README.md.
using System.Reflection;
using DHCW.SingleRecord.Maui;

var failed = 0;
void Check(string name, Func<object> make)
{
    try { make(); Console.WriteLine($"ok   {name}"); }
    catch (Exception e)
    {
        failed++;
        Console.WriteLine($"FAIL {name}: {(e.InnerException ?? e).GetType().Name}: {(e.InnerException ?? e).Message}");
    }
}

Check("SrColors, alone", () => new SrColors());
Check("SrIcons, alone", () => new SrIcons());
Check("SrStyles, alone", () => new SrStyles());

// App catches its own startup failure to show it on screen; read it back.
var app = new WcpPrototype.App();
var startup = typeof(WcpPrototype.App)
    .GetField("startupError", BindingFlags.NonPublic | BindingFlags.Instance)?
    .GetValue(app) as Exception;
if (startup is null) Console.WriteLine("ok   WCP prototype App resources");
else { failed++; Console.WriteLine($"FAIL WCP prototype App resources: {startup.Message}"); }

Application.Current = app;
Check("SplashPage", () => new WcpPrototype.Views.SplashPage());
Check("LoginPage", () => new WcpPrototype.Views.LoginPage());
Check("SignInPage", () => new WcpPrototype.Views.SignInPage());
Check("CreatePinPage", () => new WcpPrototype.Views.CreatePinPage());
Check("UnlockPage", () => new WcpPrototype.Views.UnlockPage());
Check("ShellPage", () => new WcpPrototype.Views.ShellPage());

Console.WriteLine(failed == 0 ? "smoke: everything constructed." : $"smoke: {failed} failure(s).");
return failed == 0 ? 0 : 1;
