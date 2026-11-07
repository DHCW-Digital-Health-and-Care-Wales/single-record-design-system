namespace WcpPrototype.Views;

public partial class LoginPage : ContentPage
{
    public LoginPage() => InitializeComponent();

    void OnLogin(object? sender, EventArgs e) => Flow.Go(() => new SignInPage());
}
