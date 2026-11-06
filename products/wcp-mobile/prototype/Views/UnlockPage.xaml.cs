using WcpPrototype.Controls;

namespace WcpPrototype.Views;

/// <summary>
/// Unlock with the PIN. The sixth digit submits; there is no button for it,
/// as drawn. Biometric login is simulated: it unlocks straight away.
/// </summary>
public partial class UnlockPage : ContentPage
{
    string entered = string.Empty;

    public UnlockPage()
    {
        InitializeComponent();
        Pad.Digit += OnDigit;
        Pad.Backspaced += (_, _) => { if (entered.Length > 0) entered = entered[..^1]; Dots.Show(entered.Length); };
        Pad.Cleared += (_, _) => { entered = string.Empty; Dots.Show(0); };
    }

    void OnDigit(object? sender, string d)
    {
        Message.IsVisible = false;
        if (entered.Length >= PinDots.Length) return;
        entered += d;
        Dots.Show(entered.Length);
        if (entered.Length < PinDots.Length) return;

        if (Flow.CheckPin(entered))
        {
            Unlock();
            return;
        }
        entered = string.Empty;
        Dots.Show(0);
        Message.Text = "That PIN is not right. Try again.";
        Message.IsVisible = true;
        SemanticScreenReader.Announce(Message.Text);
    }

    void OnBiometric(object? sender, EventArgs e) => Unlock();

    void OnLogOut(object? sender, EventArgs e) => Flow.LogOut();

    static void Unlock()
    {
        Flow.Unlocked();
        Flow.Go(new ShellPage());
    }
}
