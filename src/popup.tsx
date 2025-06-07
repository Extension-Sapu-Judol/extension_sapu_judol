import { useEffect, useState } from "react"
import browser from "webextension-polyfill"
import icon from "~assets/icon.png"

const Popup = () => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    browser.storage.local.get("sapuJudolEnabled").then((result) => {
      const enabledValue = (result as { sapuJudolEnabled?: boolean }).sapuJudolEnabled
      setEnabled(enabledValue ?? true)
    })
  }, [])

  const toggleExtension = async () => {
    const newState = !enabled
    setEnabled(newState)

    await browser.storage.local.set({ sapuJudolEnabled: newState })

    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]?.id) {
      await browser.tabs.reload(tabs[0].id)
    }
  }

  return (
    <div style={{
      width: 250,
      padding: "1.2rem",
      backgroundColor: "#FFF4E0",
      fontFamily: "sans-serif",
      color: "#333"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "1rem",
        gap: "0.5rem"
      }}>
        <img src={icon} alt="Sapu Judol Icon" width={32} />
        <h2 style={{ margin: 0, color: "#D62828" }}>Sapu Judol</h2>
      </div>

      <p style={{ textAlign: "center" }}>Status: <br></br>
         <strong style={{ fontSize: "16px", fontWeight: "bold", color: enabled ? "#2E7D32" : "#D32F2F" }}>
          {enabled ? "Aktif ✅" : "Nonaktif ❌"}
         </strong>
      </p>

      <button
        onClick={toggleExtension}
        style={{
          width: "100%",
          padding: "0.5rem 1rem",
          backgroundColor: enabled ? "#D62828" : "#B0B0B0",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "1rem",
          transition: "background-color 0.3s"
        }}
      >
        {enabled ? "Nonaktifkan" : "Aktifkan"}
      </button>
    </div>
  )
}

export default Popup
