using System.Windows.Input;

namespace WcpPrototype.Views;

/// <summary>
/// Home, profile and the side menu. Home and Profile swap inside one page so
/// the header and bottom bar stay put, as they do in the frames.
/// </summary>
public partial class ShellPage : ContentPage
{
    public ShellPage()
    {
        InitializeComponent();
        TabCommand = new Command<int>(OnTab);
        BindingContext = this;
    }

    public ICommand TabCommand { get; }

    async void OnTab(int index)
    {
        switch (index)
        {
            case 0: ShowHome(); break;
            case 4: await OpenMenu(); break;
            default: await Prototype.NotInPrototype(this, index == 1 ? "Watchlist" : "Patients"); break;
        }
    }

    void ShowHome()
    {
        Profile.IsVisible = false;
        Home.IsVisible = true;
    }

    void OnProfile(object? sender, TappedEventArgs e)
    {
        Home.IsVisible = false;
        Profile.IsVisible = true;
    }

    void OnSearch(object? sender, TappedEventArgs e)
    {
        ShowHome();
        Home.FocusSearch();
    }

    async void OnNotInPrototype(object? sender, TappedEventArgs e)
        => await Prototype.NotInPrototype(this, e.Parameter as string);

    async void OnOpenMenu(object? sender, TappedEventArgs e) => await OpenMenu();

    async void OnCloseMenu(object? sender, TappedEventArgs e) => await CloseMenu();

    async void OnMenuHome(object? sender, TappedEventArgs e)
    {
        ShowHome();
        await CloseMenu();
    }

    void OnLogOut(object? sender, TappedEventArgs e) => Flow.LogOut();

    async Task OpenMenu()
    {
        Menu.IsVisible = true;
        await Task.WhenAll(
            Panel.TranslateToAsync(0, 0, 200, Easing.CubicOut),
            Scrim.FadeToAsync(0.5, 200));
        SemanticScreenReader.Announce("Menu open");
    }

    async Task CloseMenu()
    {
        await Task.WhenAll(
            Panel.TranslateToAsync(-300, 0, 160, Easing.CubicIn),
            Scrim.FadeToAsync(0, 160));
        Menu.IsVisible = false;
    }

    /// <summary>Android back: close the menu, then leave profile, then the app.</summary>
    protected override bool OnBackButtonPressed()
    {
        if (Menu.IsVisible) { _ = CloseMenu(); return true; }
        if (Profile.IsVisible) { ShowHome(); return true; }
        return base.OnBackButtonPressed();
    }

    internal void BackFromProfile() => ShowHome();
}
