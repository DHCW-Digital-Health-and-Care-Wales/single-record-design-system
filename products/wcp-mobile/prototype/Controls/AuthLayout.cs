namespace WcpPrototype.Controls;

/// <summary>
/// The sign-in screens scroll as one piece, footer included, so nothing is cut
/// off on a short phone. On a tall phone the content is stretched to at least
/// the screen's height, which keeps the footer at the bottom as drawn.
/// </summary>
public static class AuthLayout
{
    public static void FillScreen(ScrollView scroller, View body)
        => scroller.SizeChanged += (_, _) =>
        {
            if (scroller.Height > 0) body.MinimumHeightRequest = scroller.Height;
        };
}
