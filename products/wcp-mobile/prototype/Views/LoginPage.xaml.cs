namespace WcpPrototype.Views;

public partial class LoginPage : ContentPage
{
    public LoginPage()
    {
        InitializeComponent();
        Controls.AuthLayout.FillScreen(Scroller, Body);
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        if (Flow.LoginMessage is { } message)
        {
            Error.Show(message);
            Flow.LoginMessage = null;
        }
    }

    void OnLogin(object? sender, EventArgs e) => Flow.Go(() => new SignInPage());
}
