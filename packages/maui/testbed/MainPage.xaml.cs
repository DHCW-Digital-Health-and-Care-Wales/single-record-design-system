using System.Windows.Input;

namespace SrTestbed;

public partial class MainPage : ContentPage
{
    int selectedTab;

    public MainPage()
    {
        InitializeComponent();
        SelectTabCommand = new Command<int>(i => SelectedTab = i);
        BindingContext = this;
    }

    public ICommand SelectTabCommand { get; }

    /// <summary>
    /// Which bottom-bar destination is current. Only Home and More have a
    /// screen; the other three are drawn because the design draws them, and
    /// selecting one shows nothing new. That is honest for a testbed — inventing
    /// three screens the design system has not specified would not be.
    /// </summary>
    public int SelectedTab
    {
        get => selectedTab;
        set
        {
            if (selectedTab == value) return;
            selectedTab = value;

            // BindableObject's, which is what the bindings in MainPage.xaml are
            // already subscribed to. An earlier version declared its own
            // PropertyChanged event and OnPropertyChanged method, which hid the
            // inherited pair (CS0114) — so the tabs would have raised an event
            // nothing was listening to.
            OnPropertyChanged();

            Home.IsVisible = value != 4;
            Diagnostics.IsVisible = value == 4;
        }
    }
}
