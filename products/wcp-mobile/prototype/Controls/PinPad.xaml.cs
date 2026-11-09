namespace WcpPrototype.Controls;

/// <summary>
/// Raises Digit, Cleared and Backspaced. It holds no PIN itself: the page
/// that owns it decides what a key press means.
/// </summary>
public partial class PinPad : ContentView
{
    public event EventHandler<string>? Digit;
    public event EventHandler? Cleared;
    public event EventHandler? Backspaced;

    public PinPad()
    {
        InitializeComponent();

        for (var n = 1; n <= 9; n++)
            AddKey(DigitKey(n.ToString()), (n - 1) / 3, (n - 1) % 3);

        var clear = new Border
        {
            Style = Res<Style>("PinKeyClear"),
            Content = new Label
            {
                Text = "Clear",
                FontAttributes = FontAttributes.Bold,
                TextColor = Res<Color>("SrColorStatusError"),
                HorizontalOptions = LayoutOptions.Center,
                VerticalOptions = LayoutOptions.Center,
            },
        };
        OnTap(clear, () => Cleared?.Invoke(this, EventArgs.Empty));
        SemanticProperties.SetDescription(clear, "Clear PIN");
        AddKey(clear, 3, 0);

        AddKey(DigitKey("0"), 3, 1);

        var back = new Border
        {
            Style = Res<Style>("PinKey"),
            Content = new Microsoft.Maui.Controls.Shapes.Path
            {
                Style = Res<Style>("IconSecondary"),
                Data = (Microsoft.Maui.Controls.Shapes.Geometry)new Microsoft.Maui.Controls.Shapes.PathGeometryConverter()
                    .ConvertFromInvariantString(Res<string>("SrIconActionBackspace"))!,
            },
        };
        OnTap(back, () => Backspaced?.Invoke(this, EventArgs.Empty));
        SemanticProperties.SetDescription(back, "Delete last digit");
        AddKey(back, 3, 2);
    }

    Border DigitKey(string d)
    {
        var label = new Label { Text = d };
        label.StyleClass = new[] { "PinDigit" };
        var key = new Border { Style = Res<Style>("PinKey"), Content = label };
        OnTap(key, () => Digit?.Invoke(this, d));
        return key;
    }

    void AddKey(View key, int row, int col)
    {
        Keys.Add(key, col, row);
    }

    static void OnTap(View v, Action action)
    {
        var tap = new TapGestureRecognizer();
        tap.Tapped += (_, _) => action();
        v.GestureRecognizers.Add(tap);
    }

    static T Res<T>(string key) => (T)Application.Current!.Resources[key];
}
