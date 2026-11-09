namespace WcpPrototype.Controls;

public partial class AuthFooter : ContentView
{
    public AuthFooter() => InitializeComponent();

    async void OnLink(object? sender, TappedEventArgs e)
        => await Prototype.NotInPrototype(this, e.Parameter as string);
}
