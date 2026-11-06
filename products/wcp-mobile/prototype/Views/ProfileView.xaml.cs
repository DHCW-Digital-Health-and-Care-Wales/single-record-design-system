namespace WcpPrototype.Views;

public partial class ProfileView : ContentView
{
    public ProfileView() => InitializeComponent();

    void OnBack(object? sender, TappedEventArgs e)
    {
        for (var p = Parent; p is not null; p = p.Parent)
            if (p is ShellPage shell) { shell.BackFromProfile(); return; }
    }
}
