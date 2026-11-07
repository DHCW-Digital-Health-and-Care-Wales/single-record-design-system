using WcpPrototype.Views;

namespace WcpPrototype;

public partial class App : Application
{
    /// <summary>A failure while building the app's resources, shown on screen
    /// rather than closing the app, so a tester can read it.</summary>
    readonly Exception? startupError;

    public App()
    {
        try
        {
            InitializeComponent();

            // Text/Inverse with alpha, for the sign-in card on the gradient.
            var inverse = (Color)Resources["SrColorTextInverse"];
            Resources["GlassFill"] = new SolidColorBrush(inverse.WithAlpha(0.1f));
            Resources["GlassEdge"] = new SolidColorBrush(inverse.WithAlpha(0.3f));
        }
        catch (Exception ex)
        {
            startupError = ex;
        }
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        Page first;
        try
        {
            first = startupError is null ? new SplashPage() : ErrorPage.For(startupError);
        }
        catch (Exception ex)
        {
            first = ErrorPage.For(ex);
        }
        return new Window(first) { Title = "WCP prototype" };
    }

    /// <summary>
    /// Coming back to the app after leaving it asks for the PIN again, as the
    /// real app does. This is also the easiest way to reach the "Welcome back"
    /// screen on BrowserStack: press Home, then reopen the app.
    /// </summary>
    protected override void OnResume()
    {
        base.OnResume();
        if (Flow.SignedIn && Windows.FirstOrDefault()?.Page is ShellPage)
            Flow.Go(() => new UnlockPage());
    }
}
