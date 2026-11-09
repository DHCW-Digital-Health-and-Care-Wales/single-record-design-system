using WcpPrototype.Controls;

namespace WcpPrototype.Views;

/// <summary>
/// Unlock with the PIN. The sixth digit submits; there is no button for it,
/// as drawn. Biometric login is simulated: it unlocks straight away.
/// After five wrong PINs the user is logged out and must sign in again and
/// create a new PIN (Flow.MaxPinAttempts).
/// </summary>
public partial class UnlockPage : ContentPage
{
    string entered = string.Empty;

    public UnlockPage()
    {
        InitializeComponent();
        AuthLayout.FillScreen(Scroller, Body);
        Pad.Digit += OnDigit;
        Pad.Backspaced += (_, _) => { if (entered.Length > 0) entered = entered[..^1]; Dots.Show(entered.Length); };
        Pad.Cleared += (_, _) => { entered = string.Empty; Dots.Show(0); };
    }

    void OnDigit(object? sender, string d)
    {
        Error.Hide();
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

        var left = Flow.MaxPinAttempts - Flow.RecordPinFailure();
        if (left <= 0)
        {
            Flow.LogOut("Too many incorrect PINs. Log in again and create a new PIN.");
            return;
        }
        Error.Show(left == 1
            ? "Incorrect PIN. You have 1 attempt left before you need to log in again."
            : $"Incorrect PIN. You have {left} attempts left.");
    }

    void OnBiometric(object? sender, EventArgs e) => Unlock();

    void OnLogOut(object? sender, EventArgs e) => Flow.LogOut();

    static void Unlock()
    {
        Flow.Unlocked();
        Flow.Go(() => new ShellPage());
    }
}
