namespace WcpPrototype.Controls;

public partial class PinError : ContentView
{
    public PinError() => InitializeComponent();

    /// <summary>Show the message, announce it, and give a short vibration.</summary>
    public void Show(string message)
    {
        Text.Text = message;
        IsVisible = true;
        SemanticScreenReader.Announce(message);
        try { HapticFeedback.Default.Perform(HapticFeedbackType.LongPress); }
        catch (Exception) { /* no haptics off-device or on this phone */ }
    }

    public void Hide() => IsVisible = false;
}
