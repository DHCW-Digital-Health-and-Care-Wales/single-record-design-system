namespace WcpPrototype.Controls;

public partial class AuthFooter : ContentView
{
    public AuthFooter()
    {
        InitializeComponent();
        try
        {
            Build.Text = $"Prototype build {AppInfo.Current.BuildString}";
            Build.IsVisible = true;
        }
        catch (NotImplementedException)
        {
            // Off-device (the smoke test) there is no platform to ask.
        }
    }

    async void OnLink(object? sender, TappedEventArgs e)
        => await Prototype.NotInPrototype(this, e.Parameter as string);
}
