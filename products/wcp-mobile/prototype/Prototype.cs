namespace WcpPrototype;

/// <summary>What happens when something outside the prototype's flow is tapped.</summary>
public static class Prototype
{
    public static Task NotInPrototype(Element from, string? what)
    {
        var page = from as Page ?? FindPage(from);
        return page is null
            ? Task.CompletedTask
            : page.DisplayAlertAsync(what ?? "Not in this prototype",
                "This prototype covers sign-in and the home screen only.", "OK");
    }

    static Page? FindPage(Element e)
    {
        for (var p = e.Parent; p is not null; p = p.Parent)
            if (p is Page page) return page;
        return null;
    }
}
