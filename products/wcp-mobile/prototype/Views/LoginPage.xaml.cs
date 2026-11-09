namespace WcpPrototype.Views;

public partial class LoginPage : ContentPage
{
    public LoginPage()
    {
        InitializeComponent();
        Controls.AuthLayout.FillScreen(Scroller, Body);
    }

    void OnLogin(object? sender, EventArgs e) => Flow.Go(() => new SignInPage());
}
