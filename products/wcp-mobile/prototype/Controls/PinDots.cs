using Microsoft.Maui.Controls.Shapes;

namespace WcpPrototype.Controls;

/// <summary>
/// Six PIN positions: 40px white circles with a Border/Strong edge, as drawn.
/// Figma shows only the empty state, so the entered state is a filled
/// Interactive/Primary dot inside the circle. Screen readers hear the count
/// ("3 of 6 digits entered"), never the digits.
/// </summary>
public class PinDots : HorizontalStackLayout
{
    public const int Length = 6;

    readonly List<Border> marks = new();

    public PinDots()
    {
        Spacing = 14;
        HorizontalOptions = LayoutOptions.Center;

        for (var i = 0; i < Length; i++)
        {
            var mark = new Border
            {
                Padding = 0,
                WidthRequest = 16,
                HeightRequest = 16,
                StrokeThickness = 0,
                HorizontalOptions = LayoutOptions.Center,
                VerticalOptions = LayoutOptions.Center,
                BackgroundColor = Token("SrColorInteractivePrimary"),
                StrokeShape = new RoundRectangle { CornerRadius = 8 },
                IsVisible = false,
            };
            marks.Add(mark);

            Add(new Border
            {
                Padding = 0,
                WidthRequest = 40,
                HeightRequest = 40,
                StrokeThickness = 1,
                BackgroundColor = Token("SrColorSurfaceSmallCards"),
                Stroke = Token("SrColorBorderStrong"),
                StrokeShape = new RoundRectangle { CornerRadius = 20 },
                Content = mark,
            });
        }
        Show(0);
    }

    public void Show(int count)
    {
        for (var i = 0; i < Length; i++) marks[i].IsVisible = i < count;
        SemanticProperties.SetDescription(this, $"{count} of {Length} digits entered");
    }

    static Color Token(string key) => (Color)Application.Current!.Resources[key];
}
