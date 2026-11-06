using WcpPrototype.Views;

namespace WcpPrototype;

public partial class App : Application
{
    public App()
    {
        InitializeComponent();

        // Text/Inverse with alpha, for the sign-in card on the gradient.
        var inverse = (Color)Resources["SrColorTextInverse"];
        Resources["GlassFill"] = new SolidColorBrush(inverse.WithAlpha(0.1f));
        Resources["GlassEdge"] = new SolidColorBrush(inverse.WithAlpha(0.3f));
    }

    protected override Window CreateWindow(IActivationState? activationState)
        => new Window(new SplashPage()) { Title = "WCP prototype" };

    /// <summary>
    /// Coming back to the app after leaving it asks for the PIN again, as the
    /// real app does. This is also the easiest way to reach the "Welcome back"
    /// screen on BrowserStack: press Home, then reopen the app.
    /// </summary>
    protected override void OnResume()
    {
        base.OnResume();
        if (Flow.SignedIn && Windows.FirstOrDefault()?.Page is ShellPage)
            Flow.Go(new UnlockPage());
    }
}
