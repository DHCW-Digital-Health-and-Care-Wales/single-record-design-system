namespace WcpPrototype.Views;

public partial class SplashPage : ContentPage
{
    bool started;

    public SplashPage() => InitializeComponent();

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (started) return;
        started = true;

        await Task.Delay(1200);
        Flow.Go(() => Flow.HasPin ? new UnlockPage() : new LoginPage());
    }
}
