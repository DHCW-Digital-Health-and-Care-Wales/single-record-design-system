using Microsoft.Maui.Controls.Shapes;

namespace WcpPrototype.Controls;

/// <summary>
/// Six PIN positions: white circles with a Border/Strong edge, as drawn.
///
/// The circles are 40px in the frame. Six of them with their gaps need 310px,
/// which is more than the card has on a narrow phone, so they share the width
/// in sixths and shrink to fit, down to 28px; never bigger than 40.
///
/// Figma shows only the empty state, so the entered state is a filled
/// Interactive/Primary dot. Screen readers hear the count ("3 of 6 digits
/// entered"), never the digits.
/// </summary>
public class PinDots : Grid
{
    public const int Length = 6;
    const double Max = 40, Min = 28, Gap = 12;

    readonly List<Border> rings = new();
    readonly List<Border> marks = new();

    public PinDots()
    {
        ColumnSpacing = Gap;
        HorizontalOptions = LayoutOptions.Fill;
        for (var i = 0; i < Length; i++) ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));

        for (var i = 0; i < Length; i++)
        {
            var mark = new Border
            {
                Padding = 0,
                StrokeThickness = 0,
                HorizontalOptions = LayoutOptions.Center,
                VerticalOptions = LayoutOptions.Center,
                BackgroundColor = Token("SrColorInteractivePrimary"),
                IsVisible = false,
            };
            var ring = new Border
            {
                Padding = 0,
                StrokeThickness = 1,
                HorizontalOptions = LayoutOptions.Center,
                BackgroundColor = Token("SrColorSurfaceSmallCards"),
                Stroke = Token("SrColorBorderStrong"),
                Content = mark,
            };
            marks.Add(mark);
            rings.Add(ring);
            this.Add(ring, i);
        }
        Size(Max);
        Show(0);
        SizeChanged += (_, _) =>
        {
            if (Width <= 0) return;
            Size(Math.Clamp((Width - Gap * (Length - 1)) / Length, Min, Max));
        };
    }

    void Size(double d)
    {
        for (var i = 0; i < Length; i++)
        {
            rings[i].WidthRequest = rings[i].HeightRequest = d;
            rings[i].StrokeShape = new RoundRectangle { CornerRadius = d / 2 };
            var m = Math.Round(d * 0.4);
            marks[i].WidthRequest = marks[i].HeightRequest = m;
            marks[i].StrokeShape = new RoundRectangle { CornerRadius = m / 2 };
        }
    }

    public void Show(int count)
    {
        for (var i = 0; i < Length; i++) marks[i].IsVisible = i < count;
        SemanticProperties.SetDescription(this, $"{count} of {Length} digits entered");
    }

    static Color Token(string key) => (Color)Application.Current!.Resources[key];
}
