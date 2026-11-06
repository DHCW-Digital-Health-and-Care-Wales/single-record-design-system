namespace WcpPrototype.Views;

public partial class SignInPage : ContentPage
{
    public SignInPage() => InitializeComponent();

    void OnContinue(object? sender, EventArgs e) => Flow.Go(new CreatePinPage());

    void OnBack(object? sender, EventArgs e) => Flow.Go(new LoginPage());

    protected override bool OnBackButtonPressed()
    {
        Flow.Go(new LoginPage());
        return true;
    }
}
