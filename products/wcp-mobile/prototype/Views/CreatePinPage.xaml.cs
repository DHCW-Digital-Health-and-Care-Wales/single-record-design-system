using WcpPrototype.Controls;

namespace WcpPrototype.Views;

/// <summary>
/// Create the PIN, then enter it again. Digits go into the first row until it
/// is full, then the second. Save is enabled once both rows are full; if they
/// differ, both clear and the user starts again.
/// </summary>
public partial class CreatePinPage : ContentPage
{
    string first = string.Empty;
    string second = string.Empty;

    public CreatePinPage()
    {
        InitializeComponent();
        AuthLayout.FillScreen(Scroller, Body);
        Pad.Digit += OnDigit;
        Pad.Backspaced += OnBackspace;
        Pad.Cleared += (_, _) => Reset(null);
    }

    void OnDigit(object? sender, string d)
    {
        HideMessage();
        if (first.Length < PinDots.Length) first += d;
        else if (second.Length < PinDots.Length) second += d;
        Render();
    }

    void OnBackspace(object? sender, EventArgs e)
    {
        if (second.Length > 0) second = second[..^1];
        else if (first.Length > 0) first = first[..^1];
        Render();
    }

    void OnSave(object? sender, EventArgs e)
    {
        if (first != second)
        {
            Reset("The PINs do not match. Enter a new PIN twice.");
            return;
        }
        Flow.SetPin(first);
        Flow.Unlocked();
        Flow.ShowPinSetConfirmation = true;
        Flow.Go(() => new ShellPage());
    }

    void Reset(string? message)
    {
        first = second = string.Empty;
        Render();
        if (message is null) { HideMessage(); return; }
        Error.Show(message);
    }

    void HideMessage() => Error.Hide();

    void Render()
    {
        FirstDots.Show(first.Length);
        SecondDots.Show(second.Length);
        Save.IsEnabled = first.Length == PinDots.Length && second.Length == PinDots.Length;
    }

    protected override bool OnBackButtonPressed()
    {
        Flow.Go(() => new LoginPage());
        return true;
    }
}
