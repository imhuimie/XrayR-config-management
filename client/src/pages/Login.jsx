import { useState } from 'react'
import api from '../utils/api'

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { password })
      localStorage.setItem('token', response.data.token)
      onLogin()
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '24px',
          color: '#2d3748',
          fontSize: '28px'
        }}>
          🚀 XrayR 配置生成器
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label className="label">管理员密码</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>

          {error && (
            <div style={{ 
              color: '#f56565', 
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          padding: '12px',
          background: '#edf2f7',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#4a5568'
        }}>
          <p>💡 默认密码: admin123456</p>
          <p style={{ marginTop: '4px' }}>请在 .env 文件中修改 ADMIN_PASSWORD</p>
        </div>
      </div>
    </div>
  )
}

export default Login

