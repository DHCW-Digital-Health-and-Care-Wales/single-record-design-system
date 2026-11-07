// Constructs what an app constructs at launch, off-device, and fails if any
// of it throws, or if any icon would be drawn blank. Each packaged dictionary is built ALONE, which is exactly what
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

// Each page must construct, and every icon on it must have a shape. A Path
// with no Data draws nothing and raises no error: that is how every XAML icon
// in the first APK came out blank on BrowserStack.
void Page(string name, Func<Page> make)
{
    Page page;
    try { page = make(); }
    catch (Exception e)
    {
        failed++;
        Console.WriteLine($"FAIL {name}: {(e.InnerException ?? e).GetType().Name}: {(e.InnerException ?? e).Message}");
        return;
    }
    var paths = ((IVisualTreeElement)page).GetVisualTreeDescendants()
        .OfType<Microsoft.Maui.Controls.Shapes.Path>().ToList();
    var blank = paths.Count(p => p.Data is null);
    if (blank > 0) { failed++; Console.WriteLine($"FAIL {name}: {blank} of {paths.Count} icons have no shape"); }
    else Console.WriteLine($"ok   {name} ({paths.Count} icons)");
}

Page("SplashPage", () => new WcpPrototype.Views.SplashPage());
Page("LoginPage", () => new WcpPrototype.Views.LoginPage());
Page("SignInPage", () => new WcpPrototype.Views.SignInPage());
Page("CreatePinPage", () => new WcpPrototype.Views.CreatePinPage());
Page("UnlockPage", () => new WcpPrototype.Views.UnlockPage());
Page("ShellPage", () => new WcpPrototype.Views.ShellPage());

Console.WriteLine(failed == 0 ? "smoke: everything constructed." : $"smoke: {failed} failure(s).");
return failed == 0 ? 0 : 1;
