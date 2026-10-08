using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;

namespace SynergyPartners.Pages.Leaders;

public sealed class DetailModel(IOptions<ZocdocOptions> zocdoc) : PageModel
{
    public string ProviderLocationId { get; private set; } = "";
    public RosterOptions Roster => zocdoc.Value.Roster;

    public void OnGet(string id) => ProviderLocationId = id;
}
