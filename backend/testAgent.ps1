# PowerShell version for Windows
# Agent.fun Devnet Testing Script

param(
    [Parameter(Mandatory=$false)]
    [string]$AgentWallet = $env:AGENT_WALLET,

    [Parameter(Mandatory=$false)]
    [string]$BackendUrl = "http://localhost:3001"
)

# Colors
$colors = @{
    Green = 'Green'
    Blue = 'Cyan'
    Yellow = 'Yellow'
    Red = 'Red'
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = 'White')
    Write-Host $Message -ForegroundColor $Color
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $colors.Blue
    Write-ColorOutput $Title -Color $colors.Yellow
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Color $colors.Blue
}

Write-ColorOutput "========================================" -Color $colors.Blue
Write-ColorOutput "   Agent.fun Devnet Testing Script" -Color $colors.Blue
Write-ColorOutput "========================================" -Color $colors.Blue
Write-Host ""

if (-not $AgentWallet) {
    Write-ColorOutput "❌ Error: AGENT_WALLET not set" -Color $colors.Red
    Write-ColorOutput "Usage: .\testAgent.ps1 -AgentWallet <your-agent-wallet>" -Color $colors.Yellow
    Write-ColorOutput "  Or set environment variable: `$env:AGENT_WALLET='<wallet>'" -Color $colors.Yellow
    exit 1
}

Write-ColorOutput "🚀 Testing Agent: $AgentWallet" -Color $colors.Green
Write-Host ""

# Test 1: Health Check
Write-Section "Test 1: Backend Health Check"
try {
    $health = Invoke-RestMethod -Uri "$BackendUrl/health" -Method Get
    $health | ConvertTo-Json -Depth 10 | Write-Host
    Write-ColorOutput "✅ Backend is healthy" -Color $colors.Green
} catch {
    Write-ColorOutput "❌ Failed to connect to backend" -Color $colors.Red
}

# Test 2: Check Agent Balance
Write-Section "Test 2: Checking Agent Portfolio"
try {
    $portfolio = Invoke-RestMethod -Uri "$BackendUrl/api/trading/portfolio/$AgentWallet" -Method Get
    $portfolio | ConvertTo-Json -Depth 10 | Write-Host
    $solBalance = $portfolio.totalValueSOL
    Write-ColorOutput "💰 Total Balance: $solBalance SOL" -Color $colors.Green
} catch {
    Write-ColorOutput "❌ Failed to fetch portfolio" -Color $colors.Red
    $solBalance = 0
}

# Test 3: Get Swap Quote
Write-Section "Test 3: Getting Swap Quote (0.01 SOL → USDC)"
try {
    $quoteBody = @{
        inputMint = "So11111111111111111111111111111111111111112"
        outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        amount = 10000000
        slippageBps = 50
    } | ConvertTo-Json

    $quote = Invoke-RestMethod -Uri "$BackendUrl/api/trading/quote" -Method Post -Body $quoteBody -ContentType "application/json"
    $quote | ConvertTo-Json -Depth 10 | Write-Host
    Write-ColorOutput "📊 Estimated Output: $($quote.outAmount) (USDC smallest units)" -Color $colors.Green
} catch {
    Write-ColorOutput "❌ Failed to get quote" -Color $colors.Red
}

# Test 4: Analyze Trade Opportunity
Write-Section "Test 4: Analyzing Trade Opportunity"
try {
    $analysisBody = @{
        agentPubkey = $AgentWallet
        inputMint = "So11111111111111111111111111111111111111112"
        outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        amount = 10000000
    } | ConvertTo-Json

    $analysis = Invoke-RestMethod -Uri "$BackendUrl/api/trading/analyze" -Method Post -Body $analysisBody -ContentType "application/json"
    $analysis | ConvertTo-Json -Depth 10 | Write-Host

    if ($analysis.canTrade -eq $true) {
        Write-ColorOutput "✅ Trade is possible!" -Color $colors.Green
        $canTrade = "Yes"
    } else {
        Write-ColorOutput "❌ Cannot trade: $($analysis.reason)" -Color $colors.Red
        $canTrade = "No"
    }
} catch {
    Write-ColorOutput "❌ Failed to analyze trade" -Color $colors.Red
    $canTrade = "Unknown"
}

# Test 5: Check Risk Metrics
Write-Section "Test 5: Risk Metrics"
try {
    $risk = Invoke-RestMethod -Uri "$BackendUrl/api/trading/risk/$AgentWallet" -Method Get
    $risk | ConvertTo-Json -Depth 10 | Write-Host

    if ($risk.isRiskLimitBreached -eq $false) {
        Write-ColorOutput "✅ Risk limits OK" -Color $colors.Green
        $riskOk = "Yes"
    } else {
        Write-ColorOutput "⚠️  Risk limits breached!" -Color $colors.Red
        $riskOk = "No"
    }
} catch {
    Write-ColorOutput "❌ Failed to fetch risk metrics" -Color $colors.Red
    $riskOk = "Unknown"
}

# Test 6: Get Token Price
Write-Section "Test 6: Get SOL Price"
try {
    $price = Invoke-RestMethod -Uri "$BackendUrl/api/trading/price/So11111111111111111111111111111111111111112" -Method Get
    $price | ConvertTo-Json -Depth 10 | Write-Host
    $solPrice = $price.price
    Write-ColorOutput "💵 SOL Price: `$$solPrice" -Color $colors.Green
} catch {
    Write-ColorOutput "❌ Failed to fetch price" -Color $colors.Red
    $solPrice = "N/A"
}

# Test 7: Simulate Trade
Write-Section "Test 7: Simulate Trade (No Execution)"
try {
    $simBody = @{
        agentPubkey = $AgentWallet
        inputMint = "So11111111111111111111111111111111111111112"
        outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        amount = 10000000
    } | ConvertTo-Json

    $simulation = Invoke-RestMethod -Uri "$BackendUrl/api/trading/simulate" -Method Post -Body $simBody -ContentType "application/json"
    $simulation | ConvertTo-Json -Depth 10 | Write-Host
    Write-ColorOutput "📈 Simulated Output: $($simulation.estimatedOutput)" -Color $colors.Green
    Write-ColorOutput "📊 Price Impact: $($simulation.priceImpact)%" -Color $colors.Green
} catch {
    Write-ColorOutput "❌ Failed to simulate trade" -Color $colors.Red
}

# Test 8: Execute Real Trade (disabled)
Write-Section "Test 8: Execute Real Trade (DISABLED)"
Write-ColorOutput "⚠️  Real trading is disabled by default" -Color $colors.Red
Write-ColorOutput "To enable, uncomment the code in the script" -Color $colors.Yellow

# Uncomment to execute real trade:
<#
try {
    Write-ColorOutput "Executing real swap..." -Color $colors.Yellow
    $swapBody = @{
        agentPubkey = $AgentWallet
        inputMint = "So11111111111111111111111111111111111111112"
        outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        amount = 10000000
        slippageBps = 50
    } | ConvertTo-Json

    $swapResult = Invoke-RestMethod -Uri "$BackendUrl/api/trading/swap" -Method Post -Body $swapBody -ContentType "application/json"
    $swapResult | ConvertTo-Json -Depth 10 | Write-Host

    if ($swapResult.success -eq $true) {
        Write-ColorOutput "✅ Trade executed successfully!" -Color $colors.Green
        Write-ColorOutput "🔗 Signature: $($swapResult.signature)" -Color $colors.Green
        Write-ColorOutput "🔍 View on Explorer: https://explorer.solana.com/tx/$($swapResult.signature)?cluster=devnet" -Color $colors.Green
    } else {
        Write-ColorOutput "❌ Trade failed: $($swapResult.error)" -Color $colors.Red
    }
} catch {
    Write-ColorOutput "❌ Failed to execute trade: $_" -Color $colors.Red
}
#>

# Summary
Write-Host ""
Write-ColorOutput "========================================" -Color $colors.Blue
Write-ColorOutput "✅ Testing Complete!" -Color $colors.Green
Write-ColorOutput "========================================" -Color $colors.Blue
Write-Host ""

Write-ColorOutput "Summary:" -Color $colors.Yellow
Write-Host "  Agent Wallet: $AgentWallet"
Write-Host "  SOL Balance: $solBalance SOL"
Write-Host "  SOL Price: `$$solPrice"
Write-Host "  Can Trade: $canTrade"
Write-Host "  Risk Limits OK: $riskOk"

Write-Host ""
Write-ColorOutput "Next steps:" -Color $colors.Yellow
Write-Host "  1. If balance is low, fund the agent with devnet SOL"
Write-Host "  2. Uncomment Test 8 to execute real trades"
Write-Host "  3. Monitor trades at: $BackendUrl/api/trading/history/<agent-id>"
Write-Host ""
