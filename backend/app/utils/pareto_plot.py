import matplotlib.pyplot as plt
import io
import base64
def plot_pareto_front(res):
    F = res.F
    plt.figure(figsize=(8, 6))
    plt.scatter(F[:, 1], -F[:, 0], c='blue', label='Pareto Front')  # x = risk, y = return
    plt.xlabel("Risk (Objective 2)")
    plt.ylabel("Return (Objective 1)")
    plt.title("Pareto Front of Portfolio Optimization")
    plt.grid(True)
    plt.legend()
    
    # Save plot to base64
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plot_base64 = base64.b64encode(buf.read()).decode("utf-8")
    buf.close()
    plt.close()
    return plot_base64
