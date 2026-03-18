# type: ignore
# pylint: skip-file
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider
from mpl_toolkits.mplot3d import axes3d

def compute_cost(x, y, w, b):
    m = x.shape[0]
    f_wb = w * x + b
    cost = np.sum((f_wb - y)**2)
    total_cost = 1 / (2 * m) * cost
    return total_cost

def plt_intuition(x_train, y_train):
    w_range = np.linspace(0, 400, 50)
    b_fixed = 100
    
    fig, ax = plt.subplots(1, 2, figsize=(12, 5))
    plt.subplots_adjust(bottom=0.25)
    
    # Left plot: Data points & current model
    ax[0].scatter(x_train, y_train, marker='x', c='r', label="Actual")
    w_init = 200
    f_wb = w_init * x_train + b_fixed
    line, = ax[0].plot(x_train, f_wb, c='b', label="Model")
    ax[0].set_title("House Prices")
    ax[0].set_xlabel("Size (1000 sqft)")
    ax[0].set_ylabel("Price (1000s of dollars)")
    ax[0].legend()
    
    # Right plot: Cost vs w
    costs = [compute_cost(x_train, y_train, w, b_fixed) for w in w_range]
    ax[1].plot(w_range, costs, label="Cost Function J")
    initial_cost = compute_cost(x_train, y_train, w_init, b_fixed)
    dot, = ax[1].plot([w_init], [initial_cost], 'ro')
    ax[1].set_title("Cost vs w (fixed b=100)")
    ax[1].set_xlabel("w")
    ax[1].set_ylabel("J(w,b)")
    
    # Add Slider
    ax_slider = plt.axes([0.25, 0.1, 0.5, 0.03])
    slider = Slider(ax_slider, 'w', 0, 400, valinit=w_init)
    
    def update(val):
        w = slider.val
        line.set_ydata(w * x_train + b_fixed)
        new_cost = compute_cost(x_train, y_train, w, b_fixed)
        dot.set_data([w], [new_cost])
        fig.canvas.draw_idle()
        
    slider.on_changed(update)
    
    # Keep reference to slider to avoid garbage collection
    plt_intuition.slider_ref = slider
    
    plt.show()

def plt_stationary(x_train, y_train):
    w_range = np.linspace(50, 350, 50)
    b_range = np.linspace(-100, 200, 50)
    W, B = np.meshgrid(w_range, b_range)
    Z = np.zeros(W.shape)
    
    for i in range(W.shape[0]):
        for j in range(W.shape[1]):
            Z[i,j] = compute_cost(x_train, y_train, W[i,j], B[i,j])
            
    fig = plt.figure(figsize=(12, 4))
    
    # 3D Plot
    ax1 = fig.add_subplot(1, 2, 1, projection='3d')
    ax1.plot_surface(W, B, Z, cmap='viridis', alpha=0.8)
    ax1.set_title("3D Surface Plot of Cost")
    ax1.set_xlabel("w")
    ax1.set_ylabel("b")
    ax1.set_zlabel("J")
    
    # Contour Plot
    ax2 = fig.add_subplot(1, 2, 2)
    CS = ax2.contour(W, B, Z, levels=20, cmap='viridis')
    ax2.clabel(CS, inline=True, fontSize=8)
    ax2.set_title("Contour Plot")
    ax2.set_xlabel("w")
    ax2.set_ylabel("b")
    
    plt.tight_layout()
    return fig, ax2, None

def plt_update_onclick(fig, ax, x_train, y_train, dyn_items):
    # Simplified version for now
    pass

def soup_bowl():
    fig = plt.figure(figsize=(8, 6))
    ax = fig.add_subplot(projection='3d')
    x = np.linspace(-10, 10, 100)
    y = np.linspace(-10, 10, 100)
    X, Y = np.meshgrid(x, y)
    Z = X**2 + Y**2  # Symmetric bowl
    
    ax.plot_surface(X, Y, Z, cmap='viridis', antialiased=False)
    ax.set_title("Convex Cost Surface (Soup Bowl)")
    ax.set_xlabel("w")
    ax.set_ylabel("b")
    plt.show()
